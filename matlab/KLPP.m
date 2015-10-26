function [G,A,La,Xc]=KLPP(X,W,m);
% [G,K,Xc]=KLPP(X,W,m,kernel);
%
% Non-Linear Principal Component Analysis.
% Kernel LPP is actually the Laplacian eigenmap embedding
%
% X: the data in an array of the form n x d, where d is the dimension
%    of each vector, and n is the total number of samples
% W: the weight matrix
% m: number of dimensions in which to project
%
% G: The projected data into the feature space given by K
%    (n x m)
%
% See: PCA, LPP, PPursuit
%

[n, d]=size(X);

if nargin<2
    % center the data
    mu=mean(X);
    Xc = X - ones(n, 1) * mu;
    
    W=Kneighbors(Kgaussian(Xc,1),7);
    m=2;
elseif nargin<3
    m=2;
end


D=sparse(diag(sum(W)));
L=D-W;
% L*ones(n,1) should be zeros(n,1) by definition!!!!!
% D*ones-W*ones is zero, but not L, precision?? (T_T)
% make it more symm -> L = (L+ L-/2)
% nearest neighbors symm ?


% For the Laplacian embedding pick the smallest eigenvalues!!!!
% SA: smallest algebraic; if not symmetric, SR: smallest real
[A,La]=eigs(L,D,m+1,'SA');

G=A(:,2:m+1); % given from smallest to highest eigenvalue

