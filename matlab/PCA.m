function [veps,vaps,Xc]=PCA(X);
% [veps,vaps,Xc]=PCA(X);
%
% Principal Component Analysis
% X: the data in an array of the form n x d, where d is the dimension
%    of each vector, and n is the total number of samples
%
% veps: column Eigenvectors, ordered by their eigenvalue
% vaps: Eigenvalues, in ascent order
% Xc:   The centered data
%
% To project in m-dimensions:
%   Y=Xc*veps(:,d-m+1:d);
%
% To check the how much energy or information we use in our 
% m-dimensional projection:
%   vals = diag(vaps);
%   d=size(vals,1);
%   sum(vals(d-m+1:d))/sum(vals)
%

[n, d]=size(X);

% center the data
m=mean(X);
Xc = X - ones(n, 1) * m;

% covariance matrix
C = Xc'*Xc;

% eigendecomposition
[veps,vaps]=eig(C);

