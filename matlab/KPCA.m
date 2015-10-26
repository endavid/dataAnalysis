function [G,K,Xc]=KPCA(X,m,kernel,c);
% [G,K,Xc]=KPCA(X,m,kernel,c);
%
% Non-Linear Principal Component Analysis
%
% X: the data in an array of the form n x d, where d is the dimension
%    of each vector, and n is the total number of samples
% m: number of dimensions in which to project
% kernel: the type of kernel K ('gaussian', 'polynomial')
% c: A parameter for the kernel
%
% G: The projected data into the feature space given by K
%    (n x m)
%
% See: PCA, LPP, PPursuit
%

if nargin<3
    kernel='gaussian';
    c=1;
elseif nargin<4
    c=1;
end


[n, d]=size(X);

% center the data
mu=mean(X);
Xc = X - ones(n, 1) * mu;

% Compute the kernel
K=sparse(eval(sprintf('K%s(Xc,c)',kernel)));

[A,La]=eigs(K,m);

G=(La.^0.5)*A';
G=G';

